"use client";

import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminProductUrl } from "@/types/product-management";

type UrlsTableProps = {
  urls: AdminProductUrl[];
  onEdit: (url: AdminProductUrl) => void;
  onDelete: (url: AdminProductUrl) => void;
};

export function ProductUrlsTable({ urls, onEdit, onDelete }: UrlsTableProps) {
  return (
    <Card>
      <CardHeader className="border-b bg-white px-4 py-4">
        <CardTitle>Product URLs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No URLs have been added for this product yet.
                  </TableCell>
                </TableRow>
              ) : (
                urls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell className="font-medium text-slate-900">{url.store_name}</TableCell>
                    <TableCell>
                      <a href={url.product_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline">
                        <ExternalLink className="h-4 w-4" />
                        <span className="truncate max-w-[300px]">{url.product_url}</span>
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={url.active ? "success" : "neutral"}>{url.active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(url)} aria-label="Edit URL">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => onDelete(url)} aria-label="Delete URL">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
