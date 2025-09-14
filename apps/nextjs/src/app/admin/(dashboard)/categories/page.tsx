"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Save, X, Folder, Gamepad2, FolderPlus, Grid3X3, Flame, Calendar, AlertTriangle } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@saasfly/ui/dialog";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@saasfly/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import { useToast } from "@saasfly/ui/use-toast";

// Mock data for categories - matching the image data
const mockCategories = [
  {
    id: "1",
    name: "Action Games",
    description: "Fast-paced action and adventure games",
    gameCount: 32,
    status: "active" as const,
    sortOrder: 1,
    icon: "🏃",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Puzzle Games",
    description: "Brain-teasing puzzle and logic games",
    gameCount: 28,
    status: "active" as const,
    sortOrder: 2,
    icon: "🧩",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-21"),
  },
  {
    id: "3",
    name: "Racing Games",
    description: "High-speed racing and driving games",
    gameCount: 18,
    status: "active" as const,
    sortOrder: 3,
    icon: "🏎️",
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-22"),
  },
  {
    id: "4",
    name: "Strategy Games",
    description: "Strategic thinking and planning games",
    gameCount: 24,
    status: "active" as const,
    sortOrder: 4,
    icon: "♟️",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-23"),
  },
  {
    id: "5",
    name: "Adventure Games",
    description: "Adventure and exploration games",
    gameCount: 21,
    status: "active" as const,
    sortOrder: 5,
    icon: "🗺️",
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-24"),
  },
  {
    id: "6",
    name: "Sports Games",
    description: "Sports and athletic games",
    gameCount: 15,
    status: "active" as const,
    sortOrder: 6,
    icon: "⚽",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "7",
    name: "Arcade Games",
    description: "Classic arcade-style games",
    gameCount: 18,
    status: "inactive" as const,
    sortOrder: 7,
    icon: "🕹️",
    createdAt: new Date("2024-01-21"),
    updatedAt: new Date("2024-01-26"),
  },
];

type Category = typeof mockCategories[0];

interface CategoryFormData {
  name: string;
  description: string;
  status: "active" | "inactive";
  sortOrder: number;
  icon: string;
  keywords?: string;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingColorCard, setEditingColorCard] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '🎮',
    gradientClass: 'from-blue-500 to-blue-600'
  });
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    status: "active",
    sortOrder: 1,
    icon: "",
    keywords: "",
  });

  // Color card categories data
  const colorCardCategories = [
    {
      id: 'action',
      name: 'Action Games',
      description: 'Fast-paced games with intense gameplay, combat, and quick reflexes',
      icon: '🎮',
      totalGames: 45,
      downloads: '12.5K',
      rating: 4.8,
      status: 'active',
      updatedAt: '2024-12-01',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 'puzzle',
      name: 'Puzzle Games',
      description: 'Mind-bending puzzles and brain teasers, logic games, strategy',
      icon: '🧩',
      totalGames: 32,
      downloads: '8.9K',
      rating: 4.6,
      status: 'active',
      updatedAt: '2024-10-15',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'racing',
      name: 'Racing Games',
      description: 'High-speed racing games, car simulation, motorcycle racing',
      icon: '🏎️',
      totalGames: 28,
      downloads: '15.2K',
      rating: 4.7,
      status: 'active',
      updatedAt: '2024-09-20',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'sports',
      name: 'Sports Games',
      description: 'Various sports simulations, basketball, football, tennis',
      icon: '🏀',
      totalGames: 19,
      downloads: '6.8K',
      rating: 4.4,
      status: 'active',
      updatedAt: '2024-09-05',
      gradient: 'from-purple-600 to-purple-700'
    },
    {
      id: 'casual',
      name: 'Casual Games',
      description: 'Easy-to-play games for relaxation, suitable for all ages',
      icon: '😊',
      totalGames: 52,
      downloads: '22.1K',
      rating: 4.9,
      status: 'active',
      updatedAt: '2024-08-05',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      id: 'strategy',
      name: 'Strategy Games',
      description: 'Deep strategic gameplay requiring planning and tactics',
      icon: '♟️',
      totalGames: 0,
      downloads: '0',
      rating: 0,
      status: 'inactive',
      updatedAt: '2024-01-15',
      gradient: 'from-red-600 to-red-700'
    }
  ];
  const [colorCards, setColorCards] = useState(colorCardCategories);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id
          ? {
              ...cat,
              ...formData,
              updatedAt: new Date(),
            }
          : cat
      );
      setCategories(updatedCategories);
      toast({
        title: "Category Updated",
        description: "The category has been successfully updated.",
      });
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        gameCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "Category Added",
        description: "The new category has been successfully created.",
      });
    }

    // Reset form
    setFormData({
      name: "",
      description: "",
      status: "active",
      sortOrder: 1,
      icon: "",
      keywords: "",
    });
    setEditingCategory(null);
    setIsAddingNew(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
      sortOrder: category.sortOrder,
      icon: category.icon,
      keywords: "",
    });
    setIsAddingNew(true);
  };

  const handleDelete = (categoryId: string) => {
    const updatedCategories = categories.filter((cat) => cat.id !== categoryId);
    setCategories(updatedCategories);
    toast({
      title: "Category Deleted",
      description: "The category has been successfully deleted.",
    });
  };

  const handleColorCardEdit = (cardId: string) => {
    setEditingColorCard(cardId);
  };

  const handleColorCardDelete = (cardId: string) => {
    setColorCards(colorCards.filter(card => card.id !== cardId));
    toast({
      title: "Category deleted",
      description: "The color card category has been successfully deleted.",
    });
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const newCard = {
        id: Date.now().toString(),
        name: newCategory.name,
        description: newCategory.description,
        icon: newCategory.icon,
        totalGames: 0,
        downloads: '0',
        rating: 0,
        status: 'active',
        updatedAt: new Date().toISOString().split('T')[0] || '',
        gradient: newCategory.gradientClass
      };
      setColorCards([...colorCards, newCard]);
      setNewCategory({
        name: '',
        description: '',
        icon: '🎮',
        gradientClass: 'from-blue-500 to-blue-600'
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Category Added",
        description: "The new category has been successfully created.",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
      sortOrder: 1,
      icon: "",
      keywords: "",
    });
    setEditingCategory(null);
    setIsAddingNew(false);
    setEditingColorCard(null);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-2">
              Manage game categories and tags
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Add Game
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="icon" className="text-right">
                      Icon
                    </Label>
                    <Input
                      id="icon"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                      className="col-span-3"
                      placeholder="🎮"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gradient" className="text-right">
                      Color
                    </Label>
                    <Select
                      value={newCategory.gradientClass}
                      onValueChange={(value) => setNewCategory(prev => ({ ...prev, gradientClass: value }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="from-blue-500 to-blue-600">Blue</SelectItem>
                        <SelectItem value="from-red-500 to-red-600">Red</SelectItem>
                        <SelectItem value="from-purple-500 to-purple-600">Purple</SelectItem>
                        <SelectItem value="from-cyan-500 to-cyan-600">Cyan</SelectItem>
                        <SelectItem value="from-pink-500 to-pink-600">Pink</SelectItem>
                        <SelectItem value="from-green-500 to-green-600">Green</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-black">{categories.length}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Grid3X3 className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Categories</p>
                <p className="text-2xl font-bold text-black">{categories.filter(cat => cat.gameCount > 20).length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Flame className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Categories</p>
                <p className="text-2xl font-bold text-black">{categories.filter(cat => {
                  const daysDiff = Math.floor((new Date().getTime() - cat.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                  return daysDiff <= 7;
                }).length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-black">{categories.filter(cat => cat.status === 'inactive').length}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colorful Category Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         {colorCards.map((card) => (
           <Card key={card.id} className={`bg-gradient-to-br ${card.gradient} text-white border-0 shadow-lg`}>
             <CardContent className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-white/20 rounded-lg">
                   <span className="text-3xl">{card.icon}</span>
                 </div>
                 <div className="flex gap-2">
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     className="text-white/80 hover:text-white hover:bg-white/20"
                     onClick={() => handleColorCardEdit(card.id)}
                   >
                     <Edit className="h-4 w-4" />
                   </Button>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/20">
                         <MoreHorizontal className="h-4 w-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => handleColorCardEdit(card.id)}>
                         <Edit className="h-4 w-4 mr-2" />
                         Edit
                       </DropdownMenuItem>
                       <DropdownMenuItem 
                         onClick={() => handleColorCardDelete(card.id)}
                         className="text-red-600"
                       >
                         <Trash2 className="h-4 w-4 mr-2" />
                         Delete
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
               </div>
               <h3 className="text-xl font-bold mb-2">{card.name}</h3>
               <p className="text-white/80 text-sm mb-4">{card.description}</p>
               <div className="grid grid-cols-3 gap-4 mb-4">
                 <div className="text-center">
                   <div className="text-2xl font-bold">{card.totalGames}</div>
                   <div className="text-xs text-white/80">Total Games</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold">{card.downloads}</div>
                   <div className="text-xs text-white/80">Downloads</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold">{card.rating > 0 ? card.rating : '-'}</div>
                   <div className="text-xs text-white/80">Rating</div>
                 </div>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className={`px-2 py-1 rounded text-xs ${
                   card.status === 'active' ? 'bg-white/20' : 'bg-red-500/50'
                 }`}>
                   {card.status === 'active' ? 'Active' : 'Inactive'}
                 </span>
                 <span className="text-white/80">Updated: {card.updatedAt}</span>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="text-white/80 hover:text-white hover:bg-white/20 p-1"
                   onClick={() => handleColorCardEdit(card.id)}
                 >
                   <Edit className="h-3 w-3" />
                 </Button>
               </div>
             </CardContent>
           </Card>
         ))}


      </div>
      
    </div>
  );
}