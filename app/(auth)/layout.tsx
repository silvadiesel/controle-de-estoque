export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4'>
      <div className='absolute inset-0 bg-[linear-(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none' />
      {children}
    </div>
  );
}
