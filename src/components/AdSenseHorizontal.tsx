import AdSenseBanner from './AdSenseBanner';

interface AdSenseHorizontalProps {
  adSlot?: string;
  className?: string;
}

export default function AdSenseHorizontal({ adSlot = '1234567890', className = '' }: AdSenseHorizontalProps) {
  return (
    <AdSenseBanner
      adSlot={adSlot}
      adFormat="horizontal"
      className={className}
    />
  );
}