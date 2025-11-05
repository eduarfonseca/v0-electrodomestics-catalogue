import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CatalogHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-1">
                <div>
                    <h1 className="text-2xl font-medium text-foreground">Electrodomésticos</h1>
                    <p className="text-muted-foreground text-sm mt-1">Todos los productos vienen con factura y 3 meses de garantía</p>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link href="/admin/login">
                        <Button variant="outline" size="sm" className="rounded-md bg-transparent">
                            Admin
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}