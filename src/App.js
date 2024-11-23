import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "./App.css";

const ALL_COMPTES_QUERY = gql`
  query {
    allComptes {
      id
      solde
      dateCreation
      type
      transactions {
        id
        montant
        date
        type
      }
    }
  }
`;

const ADD_COMPTE_MUTATION = gql`
  mutation SaveCompte($compte: CompteRequest!) {
    saveCompte(compte: $compte) {
      id
      solde
      dateCreation
      type
    }
  }
`;

const ADD_TRANSACTION_MUTATION = gql`
  mutation AddTransaction($transactionRequest: TransactionRequest!) {
    addTransaction(transactionRequest: $transactionRequest) {
      id
      montant
      date
      type
    }
  }
`;
const COMPTE_BY_ID_QUERY = gql`
  query CompteById($id: ID!) {
    compteById(id: $id) {
      id
      solde
      dateCreation
      type
      transactions {
        id
        montant
        date
        type
      }
    }
  }
`;

const COMPTE_BY_TYPE_QUERY = gql`
  query CompteByType($type: TypeCompte!) {
    compteByType(type: $type) {
      id
      solde
      dateCreation
      type
      transactions {
        id
        montant
        date
        type
      }
    }
  }
`;

const DELETE_COMPTE_MUTATION = gql`
  mutation DeleteCompte($id: ID!) {
    deleteCompte(id: $id)
  }
`;

const App = () => {
  const { loading, error, data, refetch } = useQuery(ALL_COMPTES_QUERY);
  const [saveCompte] = useMutation(ADD_COMPTE_MUTATION);
  const [addTransaction] = useMutation(ADD_TRANSACTION_MUTATION);
  const [deleteCompte] = useMutation(DELETE_COMPTE_MUTATION);
  const [searchId, setSearchId] = useState("");
  const [searchType, setSearchType] = useState("COURANT");

  const { data: compteByIdData } = useQuery(COMPTE_BY_ID_QUERY, {
    variables: { id: searchId },
    skip: !searchId, // Only fetch when searchId is set
  });

  const { data: compteByTypeData } = useQuery(COMPTE_BY_TYPE_QUERY, {
    variables: { type: searchType },
    skip: !searchType, // Only fetch when searchType is set
  });

  const [newCompte, setNewCompte] = useState({
    solde: "",
    dateCreation: "",
    type: "COURANT",
  });

  const [transaction, setTransaction] = useState({
    compteId: "",
    montant: "",
    date: "",
    type: "DEPOT",
  });

  const handleAddCompte = async (e) => {
    e.preventDefault();
    await saveCompte({ variables: { compte: newCompte } });
    setNewCompte({ solde: "", dateCreation: "", type: "COURANT" });
    refetch();
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    await addTransaction({ variables: { transactionRequest: transaction } });
    setTransaction({ compteId: "", montant: "", date: "", type: "DEPOT" });
    refetch();
  };

  const handleDeleteCompte = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      await deleteCompte({ variables: { id } });
      refetch();
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div style={{ padding: "20px" }}>
  <h1>Gestion des Comptes et Transactions</h1>

  <div className="search-add-container">
    <div>
      <h2>Add account</h2>
      <form onSubmit={handleAddCompte}>
        <input
          type="number"
          placeholder="Solde"
          value={newCompte.solde}
          onChange={(e) => setNewCompte({ ...newCompte, solde: parseFloat(e.target.value) })}
          required
        />
        <input
          type="date"
          placeholder="Date de création"
          value={newCompte.dateCreation}
          onChange={(e) => setNewCompte({ ...newCompte, dateCreation: e.target.value })}
          required
        />
        <select
          value={newCompte.type}
          onChange={(e) => setNewCompte({ ...newCompte, type: e.target.value })}
        >
          <option value="COURANT">Courant</option>
          <option value="EPARGNE">Épargne</option>
        </select>
        <button type="submit">Ajouter</button>
      </form>
    </div>
    <div><h2>Ajouter une Transaction</h2>
      <form onSubmit={handleAddTransaction}>
        <input
          type="number"
          placeholder="Account ID"
          value={transaction.compteId}
          onChange={(e) => setTransaction({ ...transaction, compteId: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Montant"
          value={transaction.montant}
          onChange={(e) => setTransaction({ ...transaction, montant: parseFloat(e.target.value) })}
          required
        />
        <input
          type="date"
          placeholder="Date"
          value={transaction.date}
          onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
          required
        />
        <select
          value={transaction.type}
          onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
        >
          <option value="DEPOT">Depot</option>
          <option value="RETRAIT">Retrait</option>
        </select>
        <button type="submit">Ajouter</button>
      </form>
</div>
    <div>
      <h2>Search account by ID</h2>
      <input
        type="number"
        placeholder="ID Compte"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
      />
    </div>
  </div>

  {compteByIdData && compteByIdData.compteById && (
    <div>
      <p>ID: {compteByIdData.compteById.id}</p>
      <p>Solde: {compteByIdData.compteById.solde}</p>
      <p>Date: {compteByIdData.compteById.dateCreation}</p>
      <p>Type: {compteByIdData.compteById.type}</p>
    </div>
  )}

<div className="search-type-container">
    <label htmlFor="compteType">search accounts by type</label>
    <select
      id="compteType"
      value={searchType}
      onChange={(e) => setSearchType(e.target.value)}
    >
      <option value="COURANT">Courant</option>
      <option value="EPARGNE">Epargne</option>
    </select>
  </div>

  {compteByTypeData && compteByTypeData.compteByType && (
    <div className="card-container">
      {compteByTypeData.compteByType.map((compte) => (
        <div className="card" key={compte.id}>
          <h5>ID: {compte.id}</h5>
          <p><strong>Solde:</strong> {compte.solde} MAD</p>
          <p><strong>Date:</strong> {compte.dateCreation}</p>
          <p><strong>Type:</strong> {compte.type}</p>
          <button className="btn" onClick={() => handleDeleteCompte(compte.id)}>
            DELETE
          </button>
        </div>
      ))}
    </div>
  )}

      <h2>List of accounts</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Solde</th>
            <th>Date of creation</th>
            <th>Type</th>
            <th>Transactions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.allComptes.map((compte) => (
            <tr key={compte.id}>
              <td>{compte.id}</td>
              <td>{compte.solde} MAD</td>
              <td>{compte.dateCreation}</td>
              <td>{compte.type}</td>
              <td>{compte.transactions.length > 0 ? (
            <ul>
              {compte.transactions.map((transaction) => (
                <li key={transaction.id}>
                  {transaction.date} - {transaction.type} - {transaction.montant} MAD
                </li>
              ))}
            </ul>
          ) : (
            <p>no transaction</p>
          )}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDeleteCompte(compte.id)}>
                  delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
