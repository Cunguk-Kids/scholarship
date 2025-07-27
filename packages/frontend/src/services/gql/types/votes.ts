export const voteSchema = `
  type votes {
    id: ID!
    voter: String
    proposalId: String
    choice: String
    createdAt: String
    updatedAt: String
  }

  input votesFilter {
    id: ID
    voter: String
    proposalId: String
  }

  type votesPage {
    items: [votes!]!
    next: String
    prev: String
  }
` as const;

export const voteQueries = `
  votes(id: String!): votes
  votess(
    after: String
    before: String
    limit: Int
    orderBy: String
    orderDirection: String
    where: votesFilter
  ): votesPage!
`as const;

