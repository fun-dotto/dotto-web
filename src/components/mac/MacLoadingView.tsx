type MacLoadingViewProps = {
  mode: "list" | "detail";
};

function LoadingBar({ className }: { className: string }) {
  return (
    <div
      className={`h-4 rounded-md bg-background-secondary animate-pulse ${className}`}
    />
  );
}

export function MacLoadingView({ mode }: MacLoadingViewProps) {
  return (
    <div aria-live="polite" aria-busy="true">
      <div className="bg-background-tertiary -mx-6 -mt-6 px-6 pt-10 pb-8 mb-8">
        {mode === "list" ? (
          <>
            <LoadingBar className="h-3 w-28 mb-4" />
            <div className="flex items-end justify-between gap-4">
              <LoadingBar className="h-12 w-56" />
              <LoadingBar className="h-4 w-12 mb-1" />
            </div>
          </>
        ) : (
          <>
            <LoadingBar className="h-3 w-20 mb-6" />
            <LoadingBar className="h-10 w-full max-w-[32rem] mb-4" />
            <div className="flex flex-wrap gap-2">
              <LoadingBar className="h-6 w-16 rounded-full" />
              <LoadingBar className="h-6 w-20 rounded-full" />
              <LoadingBar className="h-6 w-28 rounded-full" />
            </div>
          </>
        )}
      </div>

      {mode === "list" ? (
        <ul className="divide-y divide-border-primary">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="flex items-center gap-5 py-4">
              <LoadingBar className="h-4 w-7 shrink-0" />
              <div className="flex-1 min-w-0">
                <LoadingBar className="h-5 w-56 mb-2" />
                <div className="flex gap-2">
                  <LoadingBar className="h-5 w-14 rounded-full" />
                  <LoadingBar className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <LoadingBar className="hidden sm:block h-4 w-24 shrink-0" />
              <LoadingBar className="h-4 w-4 shrink-0" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-4">
          <LoadingBar className="h-5 w-full max-w-[44rem]" />
          <LoadingBar className="h-5 w-full max-w-[42rem]" />
          <LoadingBar className="h-5 w-full max-w-[38rem]" />
          <LoadingBar className="h-5 w-full max-w-[40rem]" />
          <LoadingBar className="h-5 w-full max-w-[36rem]" />
          <LoadingBar className="h-5 w-full max-w-[41rem]" />
          <LoadingBar className="h-5 w-full max-w-[34rem]" />
          <LoadingBar className="h-5 w-full max-w-[39rem]" />
        </div>
      )}
    </div>
  );
}
