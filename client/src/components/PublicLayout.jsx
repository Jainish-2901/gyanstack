import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <>
      <Header />
      <main className="container-fluid py-4 flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
