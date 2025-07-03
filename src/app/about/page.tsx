
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Target, Palette } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-headline font-bold">About CodiStyle</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          We believe fashion is more than just clothing—it's a form of self-expression. CodiStyle was born from a passion for blending timeless elegance with contemporary design, making sophisticated style accessible to everyone.
        </p>
      </div>

      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src="https://i4.codibook.net/files/1982120940801/966d8d4e4c2dbcc5/1942351839.jpg"
          alt="Stylish outfit"
          fill
          className="object-cover"
          data-ai-hint="fashion style"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white p-8">
          <h2 className="text-4xl font-headline font-bold drop-shadow-md">Our Philosophy</h2>
          <p className="mt-2 text-xl max-w-2xl drop-shadow">
            To empower individuals to discover and refine their personal style through curated collections and innovative technology.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center">
              <Palette className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Curated Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Every piece in our collection is handpicked by our stylists for its quality, style, and versatility, ensuring you always look your best.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Innovative Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We leverage the power of AI to provide personalized recommendations, virtual try-ons, and style insights tailored just for you.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Community Focused</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              CodiStyle is more than a store; it's a community of fashion enthusiasts. Share your style, get inspired, and connect with others.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-8">
        <h2 className="text-3xl font-headline font-bold">Join Our Journey</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Explore our latest collection and start defining your unique style today.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">
            Shop Now
          </Link>
        </Button>
      </div>
    </div>
  );
}
