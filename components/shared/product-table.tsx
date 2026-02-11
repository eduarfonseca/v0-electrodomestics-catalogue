// components/shared/ProductTable.tsx
"use client"

import React from "react"
import type { Electrodomestico } from "@/contexts/products-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

type Props = {
  items: Electrodomestico[]
  admin?: boolean
  onEdit?: (p: Electrodomestico) => void
  onToggleDisponibilidad?: (id: number) => void
  onDelete?: (id: number) => void
  onRowClick?: (p: Electrodomestico) => void
}

export default function ProductTable({
  items,
  admin = false,
  onEdit,
  onToggleDisponibilidad,
  onDelete,
  onRowClick,
}: Props) {
  return (
    <div className="w-full rounded-md border border-border p-2">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Producto</TableHead>
            <TableHead className="text-center">Marca</TableHead>
            <TableHead className="text-center">Categoría</TableHead>
            <TableHead className="text-center">Precio (minorista)</TableHead>
            <TableHead className="text-center">Precio (mayorista)</TableHead>
            <TableHead className="text-center">Cant. min. mayorista</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            {admin && <TableHead className="text-center">Acciones</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((p) => (
            <TableRow
              key={p.id}
              className="cursor-default transition-all duration-150 hover:rounded-md hover:bg-secondary/10 hover:dark:bg-secondary/30"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(p)
              }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={p.imagenURL || "/public/placeholder-prs7q.png"}
                      alt={p.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-center text-sm font-medium text-foreground truncate">{p.nombre}</div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm text-center text-muted-foreground">{p.marca}</TableCell>

              <TableCell className="text-sm text-center text-muted-foreground">{p.categoria}</TableCell>

              <TableCell className="text-center font-semibold">${Number(p.precioMinorista ?? 0).toFixed(2)}</TableCell>

              <TableCell className="text-center">${Number(p.precioMayorista ?? 0).toFixed(2)}</TableCell>

              <TableCell className="text-center text-sm text-muted-foreground">
                {p.cantidadMinimaMayorista ?? 0}
              </TableCell>

              <TableCell>
                <Badge
                  variant={p.disponible ? "default" : "secondary"}
                  className={p.disponible ? "bg-green-100 dark:bg-[#dcfce7]/20 text-green-600" : "bg-red-50 dark:bg-[#dc2626]/20 text-red-600"}
                >
                  {p.disponible ? "Disponible" : "Agotado"}
                </Badge>
              </TableCell>

              {admin && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit?.(p)
                      }}
                      aria-label={`Editar ${p.nombre}`}
                      className=" bg-yellow-100/60 hover:border-yellow-600 hover:bg-yellow-100/60 dark:bg-[#eab308]/20 dark:hover:bg-[#eab308]/20 dark:hover:border-yellow-600"
                    >
                      <Pencil className="h-4 w-4 text-yellow-600" />
                    </Button>


                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.(p.id)
                      }}
                      className=" bg-red-100/60 hover:border-red-600 hover:bg-red-100/60 dark:bg-[#dc2626]/20 dark:hover:bg-[#dc2626]/20 dark:hover:border-red-600"
                      aria-label={`Eliminar ${p.nombre}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600"/>
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}

          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={admin ? 8 : 7} className="text-center py-8 text-muted-foreground">
                No hay productos para mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
