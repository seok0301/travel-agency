import React from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "@mui/material";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Header from "./components/Header";
import TravelPackages from "./pages/travelPackages/TravelPackages";
import TravelPackageDetails from "./pages/travelPackages/TravelPackageDetails";
import Reservations from "./pages/reservations/Reservations";
import AddPackage from "./pages/travelPackages/AddPackages";
import AdminReservations from "./pages/reservations/AdminReservations";
import Chat from "./pages/chat/Chat";
import AdminChat from "./pages/chat/AdminChat";

const App = () => {
  return (
    <Container maxWidth="md">
      <Header />
      <Routes>
        <Route path="/" element={<TravelPackages />} />
        <Route path="/addPackage" element={<AddPackage />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/package/:packageId" element={<TravelPackageDetails />} />
        <Route path="/adminReservations" element={<AdminReservations />} />
        <Route path="/chat/:reservationId" element={<Chat />} />
        <Route path="/adminChat/:reservationId" element={<AdminChat />} />;
      </Routes>
    </Container>
  );
};

export default App;
