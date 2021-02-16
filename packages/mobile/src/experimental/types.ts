import { ProposalStage, UpvoteRecord } from '@celo/contractkit/src/wrappers/Governance'
import { PendingWithdrawal } from '@celo/contractkit/src/wrappers/LockedGold'
import BigNumber from 'bignumber.js'

export interface AccountSummary {
  lockedGold: AccountLockedGold
  pendingWithdrawals: PendingWithdrawal[]
}

export interface AccountLockedGold {
  total: BigNumber
  nonvoting: BigNumber
  requirement: BigNumber
}

export interface GovernanceProposals {
  queued: UpvoteRecord[]
  dequeued: {
    proposalID: BigNumber
    stage: ProposalStage
  }[]
  expired: BigNumber[]
}
