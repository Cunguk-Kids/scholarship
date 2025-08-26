export function NotFoundStudentFallback() {
  return (
    <div className="flex flex-col items-center justify-center grow">
      <img src="/img/Provider-form.svg" className="h-96" />
      <div className="mt-4">
        <h1 className="font-paytone text-2xl">No scholarship found !</h1>
        <p className="text-lg">Please apply some first!</p>
      </div>
    </div>
  );
}
