import { zip } from '@celo/base/lib/collections'
import { ContractKit } from '@celo/contractkit'
import { concurrentMap } from '@celo/utils/lib/async'
import { GovernanceProposals } from 'src/experimental/types'
import { getContractKitAsync } from 'src/web3/contracts'

// Most of this method is copied from the cli's governance:list code.
export const listGovernance = async (): Promise<GovernanceProposals> => {
  const kit: ContractKit = await getContractKitAsync()

  const governance = await kit.contracts.getGovernance()
  const queue = await governance.getQueue()
  const expiredQueueMap = await concurrentMap(5, queue, (upvoteRecord) =>
    governance.isQueuedProposalExpired(upvoteRecord.proposalID)
  )
  const unexpiredQueue = queue.filter((_, idx) => !expiredQueueMap[idx])
  const queuedProposals = governance.sortedQueue(unexpiredQueue)

  const dequeue = await governance.getDequeue(true)
  const expiredDequeueMap = await concurrentMap(5, dequeue, governance.isDequeuedProposalExpired)
  const unexpiredDequeue = dequeue.filter((_, idx) => !expiredDequeueMap[idx])
  const stages = await concurrentMap(5, unexpiredDequeue, governance.getProposalStage)
  const dequeuedProposals = zip(
    (proposalID, stage) => ({ proposalID, stage }),
    unexpiredDequeue,
    stages
  )

  const expiredQueue = queue
    .filter((_, idx) => expiredQueueMap[idx])
    .map((_, idx) => queue[idx].proposalID)
  const expiredDequeue = dequeue
    .filter((_, idx) => expiredDequeueMap[idx])
    .map((_, idx) => dequeue[idx])

  return {
    queued: queuedProposals,
    dequeued: dequeuedProposals,
    expired: expiredQueue.concat(expiredDequeue),
  }
}
