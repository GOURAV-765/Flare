import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] container mx-auto px-4 py-16">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">This page could not be found.</p>
        <div className="mt-6">
          <Link to="/" className="underline">Go back home</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
