import { StyleRecommender } from './style-recommender';

export function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StyleRecommender />
        <div className="text-center text-muted-foreground text-sm mt-8 border-t pt-4">
          <p>&copy; {new Date().getFullYear()} CommerceKit. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
