import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Runs from "../pages/Runs";
import RunEditor from "../pages/RunEditor";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminUserDetail from "../pages/AdminUserDetail";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/runs"
                    element={
                        <ProtectedRoute>
                            <Runs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/runs/new"
                    element={
                        <ProtectedRoute>
                            <RunEditor mode="create" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/runs/:id/edit"
                    element={
                        <ProtectedRoute>
                            <RunEditor mode="edit" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users/:id"
                    element={
                        <AdminRoute>
                            <AdminUserDetail />
                        </AdminRoute>
                    }
                />
                <Route path="*" element={<div className="p-6">Not found</div>} />
            </Routes>
        </BrowserRouter>
    );
}
