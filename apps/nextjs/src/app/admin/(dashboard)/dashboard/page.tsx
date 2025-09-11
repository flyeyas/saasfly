import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Eye,
  Gamepad2,
  Star,
  TrendingUp,
  Users,
  Edit,
  MoreHorizontal,
  Trash2,
  Menu,
  X,
} from "lucide-react";



import { Avatar, AvatarFallback, AvatarImage } from "@saasfly/ui/avatar";
import { Button } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@saasfly/ui/table";

import { Sheet, SheetContent, SheetTrigger } from "@saasfly/ui/sheet";

// Mock data for games
const recentGames = [
  {
    id: 1,
    title: "Space Explorer",
    category: "Adventure",
    status: "Published",
    views: "15.2K",
    rating: 4.8,
    date: "2024/1/15",
    image: "/api/placeholder/40/40",
  },
  {
    id: 2,
    title: "Ocean Adventure",
    category: "Puzzle",
    status: "Published",
    views: "23.4K",
    rating: 4.6,
    date: "2024/1/12",
    image: "/api/placeholder/40/40",
  },
  {
    id: 3,
    title: "Speed Racing",
    category: "Racing",
    status: "Draft",
    views: "18.7K",
    rating: 4.9,
    date: "2024/1/10",
    image: "/api/placeholder/40/40",
  },
  {
    id: 4,
    title: "City Builder",
    category: "Strategy",
    status: "Published",
    views: "12.3K",
    rating: 4.7,
    date: "2024/1/8",
    image: "/api/placeholder/40/40",
  },
  {
    id: 5,
    title: "Ninja Fighter",
    category: "Action",
    status: "Published",
    views: "28.9K",
    rating: 4.8,
    date: "2024/1/5",
    image: "/api/placeholder/40/40",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 lg:mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Games
                </CardTitle>
                <Gamepad2 className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">156</div>
                <p className="text-xs text-blue-600">
                  +12 this month
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Active Users
                </CardTitle>
                <Users className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">2,847</div>
                <p className="text-xs text-green-600">
                  +18% last week
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700">
                  Game Views
                </CardTitle>
                <Eye className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-900">45.2K</div>
                <p className="text-xs text-yellow-600">
                  +25% today
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Average Rating
                </CardTitle>
                <Star className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">4.8</div>
                <p className="text-xs text-purple-600">
                  +0.2 this month
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Charts and Tables Section */}
          <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Game Visit Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Game Visit Trend
                </CardTitle>
                <CardDescription>
                  Last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 lg:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Integration with chart library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Games by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 lg:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Pie chart would go here</p>
                    <p className="text-sm">Category breakdown visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Latest Games Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Latest Games</CardTitle>
                <CardDescription>
                  Recently added games to the platform
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1">
                Manage All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead className="hidden sm:table-cell">Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Views</TableHead>
                      <TableHead className="hidden lg:table-cell">Rating</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {recentGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Gamepad2 className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{game.title}</div>
                            <div className="text-sm text-gray-500">Game Title</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                          {game.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          game.status === "Published" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {game.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{game.views}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{game.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{game.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
    </div>
  );
}
