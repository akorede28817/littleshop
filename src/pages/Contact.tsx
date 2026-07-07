import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PHONE = "08027853427";
const WHATSAPP = "2348027853427";

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-bold">Contact Us</h1>
        <p className="mt-3 text-muted-foreground">
          Have a question about our fabrics or bags? We're here to help.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><Phone className="h-5 w-5" /></div>
            <h3 className="font-semibold">Call Us</h3>
            <p className="text-sm text-muted-foreground">Speak with our team directly.</p>
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${PHONE}`}>{PHONE}</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><MessageCircle className="h-5 w-5" /></div>
            <h3 className="font-semibold">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">Chat with us for quick orders and enquiries.</p>
            <Button asChild size="sm">
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Message on WhatsApp</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><Clock className="h-5 w-5" /></div>
            <h3 className="font-semibold">Business Hours</h3>
            <p className="text-sm text-muted-foreground">Mon – Sat: 9:00 AM – 7:00 PM<br />Sunday: Closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><MapPin className="h-5 w-5" /></div>
            <h3 className="font-semibold">Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Fast & reliable deliveries nationwide across Nigeria.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
