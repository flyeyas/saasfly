import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@saasfly/ui/table";
import { Button } from "@saasfly/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface Game {
  id: string;
  title: string;
  category: string;
  status: "published" | "draft" | "archived";
  views: number;
  createdAt: string;
}

interface GamesTableProps {
  games: Game[];
}

const statusColors = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export function GamesTable({ games }: GamesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Game Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow key={game.id}>
              <TableCell className="font-medium">{game.title}</TableCell>
              <TableCell>{game.category}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[game.status]}`}
                >
                  {statusLabels[game.status]}
                </span>
              </TableCell>
              <TableCell>{game.views.toLocaleString()}</TableCell>
              <TableCell>{game.createdAt}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}