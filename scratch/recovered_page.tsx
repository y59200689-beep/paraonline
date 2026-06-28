Created At: 2026-06-09T17:24:40Z
Completed At: 2026-06-09T17:24:40Z
File Path: `file:///Users/youssefmahir/Developer/ecom/src/app/admin/page.tsx`
Total Lines: 4700
Total Bytes: 254356
Showing lines 1 to 800
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: /* eslint-disable react-hooks/set-state-in-effect */
2: 'use client';
3: 
4: import React, { useState, useEffect } from 'react';
5: import { Product } from '../../lib/data';
6: import { supabase } from '../../lib/supabase';
7: import { getOptimizedImageUrl } from '../../lib/image-optimizer';
8: import { useTranslation } from '../../context/LanguageContext';
9: import { useSettings } from '../../context/SettingsContext';
10: import {
11:   ArrowLeft,
12:   Save,
13:   Edit3,
14:   CheckCircle,
15:   Ship,
16:   Trash2,
17:   Users,
18:   ShoppingBag,
19:   Upload,
20:   Search,
21:   Sliders,
22:   LayoutDashboard,
23:   Sparkles,
24:   Lock,
25:   LogOut,
26:   Plus,
27:   Printer,
28:   Download,
29:   ChevronRight,
30:   TrendingUp,
31:   Percent,
32:   X,
33:   FileText,
34:   Truck,
35:   Image as ImageIcon,
36:   HelpCircle,
37:   Menu,
38:   Star,
39:   Activity,
40:   Table
41: } from 'lucide-react';
42: import Link from 'next/link';
43: 
44: interface OrderItem {
45:   id: number;
46:   title: string;
47:   quantity: number;
48:   price: number;
49: }
50: 
51: interface Order {
52:   order_id: string;
53:   customer_name: string;
54:   phone_number: string;
55:   address: string;
56:   city: string;
57:   items: OrderItem[];
58:   subtotal: number;
59:   discount_amount: number;
60:   applied_coupon: string | null;
61:   gift_item: string | null;
62:   total: number;
63:   status: string;
64:   date?: string;
65:   created_at?: string;
66:   skin_diagnostic?: {
67:     skinType: string;
68:     concern: string;
69:     sunExposure: string;
70:   } | null;
71:   
<truncated 25768 bytes>
) =>
753:           o.order_id === shippingOrderId 
754:             ? { 
755:                 ...o, 
756:                 status: 'Shipped',
757:                 trackingNumber: data.trackingNumber,
758:                 trackingLink: data.trackingLink,
759:                 courier: data.courier
760:               } 
761:             : o
762:         );
763:         localStorage.setItem('ordersBM', JSON.stringify(updated));
764: 
765:         // Open A6 print preview directly or save labelData
766:         setActiveLabelData(data.labelData);
767:         setIsShippingPanelOpen(false);
768:         setIsPrintLabelOpen(true);
769:         loadOrders();
770:         
771:         // If the detail modal is open for this order, update it
772:         if (selectedOrder && selectedOrder.order_id === shippingOrderId) {
773:           setSelectedOrder({
774:             ...selectedOrder,
775:             status: 'Shipped',
776:             trackingNumber: data.trackingNumber,
777:             trackingLink: data.trackingLink,
778:             courier: data.courier
779:           } as any);
780:         }
781: 
782:         logAdminAction("Expédition Enregistrée", `Commande ${shippingOrderId} expédiée via ${selectedCourier.toUpperCase()}. N° Suivi: ${data.trackingNumber}`);
783:       } else {
784:         alert("Erreur lors de l'enregistrement : " + data.error);
785:       }
786:     } catch (err) {
787:       alert("Erreur de communication.");
788:     } finally {
789:       setIsRegisteringShipping(false);
790:     }
791:   };
792: 
793:   // Image Upload handler
794:   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
795:     const file = e.target.files?.[0];
796:     if (!file) return;
797: 
798:     setIsUploading(true);
799:     const formData = new FormData();
800:     formData.append('file', file);
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
