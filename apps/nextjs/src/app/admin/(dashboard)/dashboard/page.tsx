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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@saasfly/ui/select";
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
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to the game center admin panel</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Gamepad2 className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">156</div>
                <p className="text-sm text-gray-600 mb-2">Total Games</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">2,847</div>
                <p className="text-sm text-gray-600 mb-2">Active Users</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18% last week
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">45.2K</div>
                <p className="text-sm text-gray-600 mb-2">Game Plays</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +25% today
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">4.8</div>
                <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.2 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Charts and Tables Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Game Visit Trend Chart */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Game Visit Trend</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  Last 7 days
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Select defaultValue="last7days">
                  <SelectTrigger className="w-32 h-8 text-xs bg-white border-gray-200 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="last7days" className="text-gray-900 hover:bg-gray-50">Last 7 days</SelectItem>
                    <SelectItem value="last30days" className="text-gray-900 hover:bg-gray-50">Last 30 days</SelectItem>
                    <SelectItem value="last90days" className="text-gray-900 hover:bg-gray-50">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="text-center text-gray-600">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                <p className="font-medium mb-1">Game Visit Trend Chart</p>
                <p className="text-sm text-gray-500">Chart visualization placeholder</p>
                <div className="mt-4 flex justify-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Visits</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Unique Users</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Distribution */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Hot Categories</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  Popular game categories
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
               <div className="text-center text-gray-600">
                 <Activity className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                 <p className="font-medium mb-1">Category Distribution Chart</p>
                 <p className="text-sm text-gray-500">Pie chart visualization placeholder</p>
                 <div className="mt-4 space-y-2 text-xs">
                   <div className="flex items-center justify-center">
                     <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                     <span>Action (35%)</span>
                   </div>
                   <div className="flex items-center justify-center">
                     <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                     <span>Puzzle (28%)</span>
                   </div>
                   <div className="flex items-center justify-center">
                     <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                     <span>Adventure (22%)</span>
                   </div>
                   <div className="flex items-center justify-center">
                     <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                     <span>Strategy (15%)</span>
                   </div>
                 </div>
                    <p className="text-sm">Category breakdown visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
      {/* Latest Games Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Latest Games</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Recently added games to the platform
              </CardDescription>
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
