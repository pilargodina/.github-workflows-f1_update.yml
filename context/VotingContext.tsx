import React, { createContext, useContext, useState } from 'react';

const VotingContext = createContext<any>(null);

export const VotingProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotes, setUserVotes] = useState(null);

  const saveVotes = (votes: any) => {
    setUserVotes(votes);
    setHasVoted(true); // Aquí marcamos que ya votó
  };

  return (
    <VotingContext.Provider value={{ hasVoted, userVotes, saveVotes }}>
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => useContext(VotingContext);