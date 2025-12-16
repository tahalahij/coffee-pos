'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Printer, CreditCard, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Product, Category } from '@/types'
import { CheckoutModal } from './checkout-modal'
import { useCartStore } from '@/hooks/use-cart-store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export function POSInterface() {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [taxRate, setTaxRate] = useState(0)
	const { items, addItem, updateQuantity, getTotalAmount, clearCart } =
		useCartStore()

	// Load tax rate from settings
	useEffect(() => {
		try {
			const savedSettings = localStorage.getItem('cafeSettings')
			if (savedSettings) {
				const settings = JSON.parse(savedSettings)
				const rate = parseFloat(settings.taxRate) || 0
				setTaxRate(rate / 100) // Convert percentage to decimal
			}
		} catch (e) {
			console.error('Error loading tax settings:', e)
		}
	}, [])

	// Fetch categories and products from API
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)

				// Fetch categories
				const categoriesResponse = await api.get('/categories')
				const fetchedCategories = categoriesResponse.data
				setCategories(fetchedCategories)

				// Set first category as selected by default
				if (fetchedCategories.length > 0) {
					setSelectedCategory(fetchedCategories[0].id)
				}

				// Fetch products
				const productsResponse = await api.get('/products')
				setProducts(productsResponse.data)

			} catch (error) {
				console.error('Error fetching data:', error)
				toast.error('خطا در بارگذاری محصولات')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	const filteredProducts = products.filter(
		(product) =>
			(selectedCategory === null || product.categoryId === selectedCategory) && product.isAvailable
	)

	const handleAddToCart = (product: Product) => {
		addItem(product)
		toast.success(`${product.name} به سبد اضافه شد`, { duration: 1000 })
	}

	const handleCheckout = () => {
		setIsCheckoutOpen(true)
	}

	const handleCheckoutComplete = () => {
		clearCart()
		setIsCheckoutOpen(false)
	}

	if (loading) {
		return (
			<div className="flex h-full bg-gradient-to-br from-slate-50 to-blue-50 items-center justify-center">
				<div className="text-center">
					<div className="relative">
						<div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
						<Sparkles className="h-6 w-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
					</div>
					<p className="text-gray-500 mt-4 font-medium">در حال بارگذاری محصولات...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
			{/* Product Selection Area */}
			<div className="flex-1 flex flex-col p-6">
				{/* Category Tabs */}
				<div className="flex gap-2 mb-6 overflow-x-auto pb-2">
					<Button
						variant={selectedCategory === null ? 'default' : 'outline'}
						onClick={() => setSelectedCategory(null)}
						className={`px-6 py-2 rounded-xl whitespace-nowrap transition-all ${
							selectedCategory === null 
								? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25' 
								: 'hover:bg-blue-50 border-gray-200'
						}`}
					>
						همه
					</Button>
					{categories.map((category) => (
						<Button
							key={category.id}
							variant={selectedCategory === category.id ? 'default' : 'outline'}
							onClick={() => setSelectedCategory(category.id)}
							className={`px-6 py-2 rounded-xl whitespace-nowrap transition-all ${
								selectedCategory === category.id 
									? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25' 
									: 'hover:bg-blue-50 border-gray-200'
							}`}
						>
							{category.name}
						</Button>
					))}
				</div>

				{/* Product List */}
				<div className="flex-1 overflow-auto">
					{filteredProducts.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<ShoppingCart className="h-10 w-10 text-gray-400" />
							</div>
							<p className="text-gray-500 text-lg">
								{selectedCategory !== null ? 'هیچ محصولی در این دسته موجود نیست' : 'هیچ محصولی موجود نیست'}
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{filteredProducts.map((product) => (
								<button
									key={product.id}
									className="flex items-center justify-between p-4 bg-white/80 backdrop-blur rounded-xl border-0 shadow-sm hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all duration-200 group"
									onClick={() => handleAddToCart(product)}
								>
									<span className="font-medium text-gray-800 group-hover:text-white">
										{product.name}
									</span>
									<div className="flex items-center gap-3">
										<span className="font-bold text-blue-600 group-hover:text-white">
											{formatCurrency(product.price)}
										</span>
										<Plus className="h-5 w-5 text-gray-400 group-hover:text-white" />
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Cart Sidebar */}
			<div className="w-96 bg-white/90 backdrop-blur-lg border-r border-gray-200/50 flex flex-col shadow-2xl">
				<div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-500 to-indigo-500">
					<div className="flex items-center justify-between text-white">
						<h2 className="text-xl font-bold flex items-center">
							<ShoppingCart className="h-5 w-5 ml-2" />
							سفارش جاری
						</h2>
						<div className="flex items-center gap-2">
							{items.length > 0 && (
								<button
									onClick={() => {
										if (confirm('آیا از پاک کردن سبد خرید مطمئن هستید؟')) {
											clearCart()
											toast.success('سبد خرید پاک شد')
										}
									}}
									className="bg-white/20 backdrop-blur hover:bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
									title="پاک کردن سبد"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							)}
							<span className="bg-white/20 backdrop-blur text-white text-sm font-medium px-3 py-1 rounded-full">
								{items.length} مورد
							</span>
						</div>
					</div>
				</div>

				{/* Cart Items */}
				<div className="flex-1 overflow-auto p-6">
					{items.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<ShoppingCart className="h-10 w-10 text-gray-300" />
							</div>
							<p className="text-gray-500">هیچ موردی در سبد خرید نیست</p>
						</div>
					) : (
						<div className="space-y-4">
							{items.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm"
								>
									<div className="flex-1">
										<h4 className="font-bold text-gray-800">
											{item.product.name}
										</h4>
										<p className="text-sm text-gray-500">
											{formatCurrency(item.price)} هر عدد
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Button
											size="sm"
											variant="outline"
											className="h-8 w-8 p-0 rounded-full border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
											onClick={() =>
												updateQuantity(
													item.id,
													Math.max(0, item.quantity - 1)
												)
											}
										>
											<Minus className="h-3 w-3" />
										</Button>
										<span className="w-8 text-center font-bold text-gray-800">
											{item.quantity}
										</span>
										<Button
											size="sm"
											variant="outline"
											className="h-8 w-8 p-0 rounded-full border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
											onClick={() =>
												updateQuantity(item.id, item.quantity + 1)
											}
										>
											<Plus className="h-3 w-3" />
										</Button>
									</div>
									<div className="mr-4 text-left">
										<p className="font-bold text-blue-600">
											{formatCurrency(item.price * item.quantity)}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Cart Total & Checkout */}
				{items.length > 0 && (
					<div className="p-6 border-t border-gray-200/50 bg-gradient-to-b from-gray-50 to-white">
						<div className="space-y-3 mb-4">
							<div className="flex justify-between text-gray-600">
								<span>جمع جزء:</span>
								<span className="font-medium">{formatCurrency(getTotalAmount())}</span>
							</div>
							{taxRate > 0 && (
								<div className="flex justify-between text-gray-600">
									<span>مالیات ({Math.round(taxRate * 100)}٪):</span>
									<span className="font-medium">{formatCurrency(getTotalAmount() * taxRate)}</span>
								</div>
							)}
							<div className="flex justify-between font-bold text-xl border-t-2 border-dashed pt-3">
								<span className="text-gray-800">مجموع:</span>
								<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{formatCurrency(getTotalAmount() * (1 + taxRate))}</span>
							</div>
						</div>

						<div className="space-y-3">
							<Button
								onClick={handleCheckout}
								className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/25 h-12 text-lg"
								size="lg"
							>
								<CreditCard className="h-5 w-5 ml-2" />
								پرداخت
							</Button>
							<Button
								variant="outline"
								className="w-full border-gray-200 hover:bg-gray-50 h-11"
								size="lg"
							>
								<Printer className="h-4 w-4 ml-2" />
								چاپ رسید
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Checkout Modal */}
			{isCheckoutOpen && (
				<CheckoutModal
					isOpen={isCheckoutOpen}
					onClose={() => setIsCheckoutOpen(false)}
					onComplete={handleCheckoutComplete}
					total={getTotalAmount() * (1 + taxRate)}
					items={items}
				/>
			)}
		</div>
	)
}
