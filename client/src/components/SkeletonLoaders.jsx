import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card h-100 d-flex flex-column p-4 transition-all">
    <div className="d-flex align-items-center mb-3">
      <div className="skeleton rounded-circle me-3" style={{ width: '50px', height: '50px' }}></div>
      <div className="flex-grow-1">
        <div className="skeleton mb-2" style={{ width: '70%', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '40%', height: '14px' }}></div>
      </div>
    </div>
    <div className="skeleton mb-3" style={{ width: '100%', height: '100px' }}></div>
    <div className="d-flex gap-2 mb-4">
      <div className="skeleton rounded-pill" style={{ width: '60px', height: '24px' }}></div>
      <div className="skeleton rounded-pill" style={{ width: '60px', height: '24px' }}></div>
    </div>
    <div className="mt-auto d-flex justify-content-between align-items-center">
      <div className="skeleton rounded-pill" style={{ width: '80px', height: '36px' }}></div>
      <div className="d-flex gap-2">
        <div className="skeleton rounded-circle" style={{ width: '38px', height: '38px' }}></div>
        <div className="skeleton rounded-circle" style={{ width: '38px', height: '38px' }}></div>
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="row text-center justify-content-center">
    {[1, 2, 3].map((i) => (
      <div key={i} className="col-md-4 mb-4 mb-md-0 px-lg-5">
        <div className="p-3 d-flex flex-column align-items-center">
          <div className="skeleton rounded-circle mb-3" style={{ width: '70px', height: '70px' }}></div>
          <div className="skeleton mb-2" style={{ width: '100px', height: '48px' }}></div>
          <div className="skeleton" style={{ width: '120px', height: '20px' }}></div>
        </div>
      </div>
    ))}
  </div>
);

export const ListSkeleton = () => (
  <div className="mb-4">
     <div className="skeleton mb-3" style={{ width: '200px', height: '32px' }}></div>
     <div className="row g-3">
        {[1, 2, 3].map(i => (
            <div key={i} className="col-12">
                <div className="skeleton" style={{ width: '100%', height: '60px' }}></div>
            </div>
        ))}
     </div>
  </div>
);
