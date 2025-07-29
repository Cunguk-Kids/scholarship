export const studentSchema = `
  type students {
    id: String!
blockchainId: Int
studentAddress: String
programId: String
fullName: String
email: String
financialSituation: String
scholarshipMotivation: String
createdAt: String
updatedAt: String
program: programs
milestones(
where: milestonesFilter
orderBy: String
orderDirection: String
before: String
after: String
limit: Int
): milestonesPage
achievements(
where: achievementsFilter
orderBy: String
orderDirection: String
before: String
after: String
limit: Int
): achievementsPage
votes(
where: votesFilter
orderBy: String
orderDirection: String
before: String
after: String
limit: Int
): votesPage
  }

  input studentsFilter {
    id: ID
    name: String
  }

  type studentsPage {
    items: [students!]!
    next: String
    prev: String
  }

`as const;

export const studentQueries = `
  students(id: String!): students
  studentss(
    after: String
    before: String
    limit: Int
    orderBy: String
    orderDirection: String
    where: studentsFilter
  ): studentsPage!
` as const;