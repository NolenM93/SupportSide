export function DeviceFrame({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="device-frame mx-auto h-full max-h-[760px] w-full max-w-[390px]">
      <div className="device-notch" aria-hidden />
      <div className="absolute left-1/2 top-[22px] z-[3] -translate-x-1/2 text-[10px] font-semibold tracking-wide text-white/70">
        {title}
      </div>
      <div className="device-screen h-[min(680px,calc(100dvh-220px))]">{children}</div>
    </div>
  );
}
