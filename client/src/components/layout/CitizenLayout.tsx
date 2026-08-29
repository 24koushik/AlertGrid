import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { NotificationCenter } from "../notifications/NotificationCenter";
import {
  Shield,
  Home,
  AlertTriangle,
  Map,
  HelpCircle,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertGridLogo } from "./AlertGridLogo";

export function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDemoAccount = user?.email?.endsWith("@alertgrid.demo");

  const navigation = [
    { name: "Command Center", href: "/citizen", icon: Home },
    { name: "Emergency Alerts", href: "/citizen/alerts", icon: AlertTriangle },
    { name: "Shelters", href: "/citizen/shelters", icon: Map },
    { name: "My Requests", href: "/citizen/requests", icon: FileText },
  ];

  const bottomNavigation = [
    { name: "Help & Safety", href: "/citizen/guides", icon: HelpCircle },
    { name: "Settings", href: "/citizen/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <div className="flex items-center">
            <AlertGridLogo showIcon={false} theme="light" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col">
          <nav className="flex-1 px-4 space-y-1">
            <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Safety
            </div>
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/citizen" &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-brand-indigo/10 text-brand-indigo"
                      : "text-foreground/70 hover:bg-slate-100 hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-4 w-4 ${isActive ? "text-brand-indigo" : "text-muted-foreground"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mt-8 space-y-1">
            <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Account
            </div>
            {bottomNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-brand-indigo/10 text-brand-indigo"
                      : "text-foreground/70 hover:bg-slate-100 hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-4 w-4 ${isActive ? "text-brand-indigo" : "text-muted-foreground"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-col bg-card border-r border-border">
            <div className="flex h-16 items-center justify-between px-6 border-b border-border">
              <div className="flex items-center">
                <AlertGridLogo showIcon={false} theme="light" />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Safety
              </div>
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/citizen" &&
                    location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-brand-indigo/10 text-brand-indigo"
                        : "text-foreground/70 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="px-2 mt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Account
              </div>
              {bottomNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-brand-indigo/10 text-brand-indigo"
                        : "text-foreground/70 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Presentation Banner */}
        {isDemoAccount && (
          <div className="bg-brand-indigo text-white px-4 py-2 flex items-center justify-between text-sm z-50 shadow-sm">
            <div className="flex items-center font-medium">
              <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
              PRESENTATION MODE - Demo Account
            </div>
            <button
              onClick={logout}
              className="text-white hover:text-brand-indigo hover:bg-white px-3 py-1 rounded transition-colors font-bold text-xs uppercase tracking-wider"
            >
              Exit Demo
            </button>
          </div>
        )}

        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6 z-10 shadow-sm">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <div className="hidden sm:flex items-center border-l pl-4 ml-2">
              <div className="mr-3 text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.name}
                </p>
                <p className="text-xs font-bold text-brand-teal">CITIZEN</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold">
                {user?.name?.charAt(0).toUpperCase() || "C"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-brand-red"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
