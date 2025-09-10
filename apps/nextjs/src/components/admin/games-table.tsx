import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@saasfly/ui/table";
import { Badge } from "@saasfly/ui/badge";
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
  published: "已发布",
  draft: "草稿",
  archived: "已归档",
};

export function GamesTable({ games }: GamesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>游戏名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>访问量</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow key={game.id}>
              <TableCell className="font-medium">{game.title}</TableCell>
              <TableCell>{game.category}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[game.status]}
                >
                  {statusLabels[game.status]}
                </Badge>
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