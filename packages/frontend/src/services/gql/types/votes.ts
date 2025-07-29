export const voteSchema = `
  type votes {
  id: String!
  address: String
  programId: String
  studentId: String
  blockchainProgramId: Int
  blockchainStudentId: Int
  ipAddress: String
  createdAt: String
  updatedAt: String
  student: students
  program: programs
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

