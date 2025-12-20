import React from "react";
import { Button } from "primereact/button";

interface ITimelineNavigationProps {
  currentWeekDisplay: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onExitHistory: () => void;
}

export const TimelineNavigation = ({
  currentWeekDisplay,
  onPreviousWeek,
  onNextWeek,
  onExitHistory,
}: ITimelineNavigationProps) => {
  return (
    <div className="timeline-navigation" style={{
      border: '2px solid #094a90',
      borderRadius: '4px',
      padding: '12px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text p-button-secondary"
          onClick={onPreviousWeek}
          style={{
            padding: '8px',
            borderRadius: '4px',
            color: '#094a90',
            border: 'none',
            background: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(9, 74, 144, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        />
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#094a90',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          {currentWeekDisplay}
        </span>
        <Button
          icon="pi pi-arrow-right"
          className="p-button-text p-button-secondary"
          onClick={onNextWeek}
          style={{
            padding: '8px',
            borderRadius: '4px',
            color: '#094a90',
            border: 'none',
            background: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(9, 74, 144, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        />
      </div>

      <Button
        label="Salir del historial"
        icon="pi pi-times"
        className="p-button-outlined p-button-secondary"
        onClick={onExitHistory}
        style={{
          fontSize: '14px',
          padding: '8px 16px'
        }}
      />
    </div>
  );
};