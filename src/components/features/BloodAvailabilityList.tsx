// src/components/BloodAvailabilityList.tsx
import React from "react";

interface BloodAvailability {
  bloodType: string;
  units: number;
}

interface BloodAvailabilityListProps {
  availability: BloodAvailability[];
}

const BloodAvailabilityList: React.FC<BloodAvailabilityListProps> = ({
  availability,
}) => {
  return (
    <ul>
      {availability.map(({ bloodType, units }) => (
        <li key={bloodType}>
          {bloodType}: {units} units
        </li>
      ))}
    </ul>
  );
};

export default BloodAvailabilityList;
