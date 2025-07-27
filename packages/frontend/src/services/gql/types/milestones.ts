export const milestoneSchema = `
  type milestones {
    id: ID!
    milestoneId: Int
    isCollected: Boolean
    studentId: Int
    programId: Int
    type: String
    description: String
    estimation: Int
    amount: Int
    metadataCID: String
    proveCID: String
    createdAt: String
    updatedAt: String
  }

  input milestonesFilter {
    id: ID
    title: String
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
