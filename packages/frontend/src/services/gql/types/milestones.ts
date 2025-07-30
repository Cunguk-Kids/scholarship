export const milestoneSchema = `
  type milestones {
  id: String!
  blockchainId: Int
  amount: Int
  studentId: String
  programId: String
  metadataCID: String
  proveCID: String
  isCollected: Boolean
  type: String
  description: String
  estimation: Int
  createdAt: String
  updatedAt: String
  student: students
  program: programs
  }

  input milestonesFilter {
    id: ID
    title: String
    programId: String
    studentId: String
  }

  type milestonesPage {
    items: [milestones!]!
    next: String
    prev: String
  }
` as const;

export const milestoneQueries = `
  milestones(id: String!): milestones
  milestoness(
    after: String
    before: String
    limit: Int
    orderBy: String
    orderDirection: String
    where: milestonesFilter
  ): milestonesPage!
`as const;
