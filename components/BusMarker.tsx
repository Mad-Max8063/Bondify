import React from 'react';
import { Marker } from 'react-leaflet';
import { BusEntity, BusStatus } from '../types';
import { createBusIcon } from '../utils/leafletIcons';

interface BusMarkerProps {
  bus: BusEntity;
  onClick: (bus: BusEntity) => void;
  isSelected: boolean;
}

export const BusMarker: React.FC<BusMarkerProps> = ({ bus, onClick, isSelected }) => {
  // zIndexOffset: Leaflet specific prop to handle stacking order.
  // Problem (600) > Verified (500) > Trail (300) > Ghost (100). Selected adds 1000.
  let zIndexBase = 100;
  if (bus.status === BusStatus.VERIFIED) zIndexBase = 500;
  if (bus.status === BusStatus.TRAIL) zIndexBase = 300;
  if (bus.status === BusStatus.PROBLEM) zIndexBase = 600;
  
  const zIndexOffset = isSelected ? 1000 : zIndexBase;

  return (
    <Marker
      position={[bus.lat, bus.lng]}
      icon={createBusIcon(bus, isSelected)}
      zIndexOffset={zIndexOffset}
      eventHandlers={{
        click: () => onClick(bus),
      }}
    />
  );
};