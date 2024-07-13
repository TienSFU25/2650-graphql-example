import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const GetTweets = gql`
  query {
    Tweets {
      id
      body
      Author {
        username
        full_name
      }
    }
  }
`;

function Home(props) {
  const client = useApolloClient();
  const { id } = useParams();
  const [tweets, setTweets] = useState([]);
  console.log(`LOADING APP ID ${id}, props ${JSON.stringify(props)}`);
  const navigate = useNavigate();

  // const { loading, error, data, refetch } = useQuery(GetTweets, {
  //   pollInterval: 0,
  //   notifyOnNetworkStatusChange: true,
  //   onError: (error) => {
  //     console.log(`Apollo error: ${JSON.stringify(error, null, 2)}`);
  //   },
  //   onCompleted: (data) => {
  //     console.log(`COMPLETED THE QUERY ${data.length}`);
  //     // setTweets(data.Tweets);
  //   },
  // });

  useEffect(() => {
    async function fetchData() {
      console.log(`refetching stuff`);
      // refetch();
      const { data } = await client.query({
        query: GetTweets,
        fetchPolicy: "network-only",
      });
      console.log(`done fetching ${JSON.stringify(data.Tweets)}`);
      setTweets(data.Tweets);
    }
    fetchData();
  }, [id]);

  // async function fetchData() {
  //   console.log(`refetching stuff`);
  //   // refetch();
  //   const { data } = await client.query({ query: GetTweets });
  //   console.log(`done fetching ${data}`);
  //   setTweets(data.tweets);
  // }

  // fetchData();

  const refresh = () => {
    // navigate("/");
    navigate(`/yay/${id ? parseInt(id) + 1 : 1}`);
  };

  return (
    <div>
      <button onClick={refresh}>reload data</button>
      <pre>{JSON.stringify(tweets, null, 2)}</pre>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/yay/:id" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
