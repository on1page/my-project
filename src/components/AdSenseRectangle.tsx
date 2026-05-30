import AdSenseBanner from './AdSenseBanner';

interface AdSenseRectangleProps {
  adSlot?: string;
  className?: string;
}

export default function AdSenseRectangle({ adSlot = '1234567890', className = '' }: AdSenseRectangleProps) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="rectangle"
      className={className}
    />
  );
}