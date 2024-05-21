import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import { Editor } from "../components/Builder/Index";
import ListProfiles from "../components/Resume/ListProfiles";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/profiles" element={<ListProfiles />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-builder" element={<Editor />} />

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
