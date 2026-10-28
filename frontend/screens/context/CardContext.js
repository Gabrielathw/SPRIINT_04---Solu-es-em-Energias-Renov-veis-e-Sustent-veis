import React, { createContext, useState, useContext } from 'react';

const CardContext = createContext();

export const CardProvider = ({ children }) => {
  const [cartoes, setCartoes] = useState([]);

  const adicionarCartao = (cartao) => setCartoes([...cartoes, cartao]);
  const removerCartao = (index) => setCartoes(cartoes.filter((_, i) => i !== index));

  return (
    <CardContext.Provider value={{ cartoes, adicionarCartao, removerCartao }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCard = () => useContext(CardContext);