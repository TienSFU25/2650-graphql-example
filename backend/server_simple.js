import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
    type Query {
        hello: String
    }
`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Launch the server
const { url } = await startStandaloneServer(server);

console.log(`🚀 Server listening at: ${url}`);
