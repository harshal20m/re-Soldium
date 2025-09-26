import { create } from "zustand";
import { Product, ProductFilters } from "@/types";

interface ProductState {
    products: Product[];
    filters: ProductFilters;
    isLoading: boolean;
    searchTerm: string;
    setProducts: (products: Product[]) => void;
    setFilters: (filters: ProductFilters) => void;
    setLoading: (loading: boolean) => void;
    setSearchTerm: (term: string) => void;
    addProduct: (product: Product) => void;
    updateProduct: (id: string, product: Partial<Product>) => void;
    removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    filters: {},
    isLoading: false,
    searchTerm: "",
    setProducts: (products) => set({ products }),
    setFilters: (filters) => set({ filters }),
    setLoading: (isLoading) => set({ isLoading }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    addProduct: (product) =>
        set((state) => ({
            products: [product, ...state.products],
        })),
    updateProduct: (id, updatedProduct) =>
        set((state) => ({
            products: state.products.map((p) =>
                p._id === id ? { ...p, ...updatedProduct } : p
            ),
        })),
    removeProduct: (id) =>
        set((state) => ({
            products: state.products.filter((p) => p._id !== id),
        })),
}));
