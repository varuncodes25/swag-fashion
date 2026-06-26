import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  Shield
} from "lucide-react";
import { POLICY } from "@/constants/siteConfig";

const ProductServices = () => {
  const STATIC_SERVICES = [
    {
      id: "authentic",
      title: "100% Authentic",
      desc: "Genuine product with verification",
      icon: Shield,
      color: "green",
      iconComponent: Shield,
      gradientFrom: "from-green-50",
      gradientTo: "to-emerald-50",
      darkGradientFrom: "dark:from-green-900/20",
      darkGradientTo: "dark:to-emerald-900/10",
      borderColor: "border-green-100",
      darkBorderColor: "dark:border-green-800/30",
      hoverBorder: "hover:border-green-200",
      darkHoverBorder: "dark:hover:border-green-700/50",
      textColor: "text-green-700",
      darkTextColor: "dark:text-green-300"
    },
    {
      id: "quality",
      title: "Quality Checked",
      desc: "Each unit tested & verified",
      icon: ShieldCheck,
      color: "blue",
      iconComponent: ShieldCheck,
      gradientFrom: "from-blue-50",
      gradientTo: "to-cyan-50",
      darkGradientFrom: "dark:from-blue-900/20",
      darkGradientTo: "dark:to-cyan-900/10",
      borderColor: "border-blue-100",
      darkBorderColor: "dark:border-primary/30/30",
      hoverBorder: "hover:border-primary/25",
      darkHoverBorder: "dark:hover:border-blue-700/50",
      textColor: "text-primary",
      darkTextColor: "dark:text-primary"
    },
    {
      id: "secure",
      title: "Secure Payment",
      desc: "SSL encrypted transactions",
      icon: Lock,
      color: "purple",
      iconComponent: Lock,
      gradientFrom: "from-purple-50",
      gradientTo: "to-violet-50",
      darkGradientFrom: "dark:from-purple-900/20",
      darkGradientTo: "dark:to-violet-900/10",
      borderColor: "border-purple-100",
      darkBorderColor: "dark:border-purple-800/30",
      hoverBorder: "hover:border-purple-200",
      darkHoverBorder: "dark:hover:border-purple-700/50",
      textColor: "text-purple-700",
      darkTextColor: "dark:text-purple-300"
    },
    {
      id: "returns",
      title: "Easy Exchanges",
      desc: `${POLICY.exchangeShort} — ${POLICY.noReturnsNote.toLowerCase()}`,
      icon: RefreshCw,
      color: "orange",
      iconComponent: RefreshCw,
      gradientFrom: "from-orange-50",
      gradientTo: "to-amber-50",
      darkGradientFrom: "dark:from-orange-900/20",
      darkGradientTo: "dark:to-amber-900/10",
      borderColor: "border-orange-100",
      darkBorderColor: "dark:border-orange-800/30",
      hoverBorder: "hover:border-orange-200",
      darkHoverBorder: "dark:hover:border-orange-700/50",
      textColor: "text-orange-700",
      darkTextColor: "dark:text-orange-300"
    },
    // {
    //   id: "packaging",
    //   title: "Safe Packaging",
    //   desc: "Damage-proof secure packing",
    //   icon: Package,
    //   color: "gray",
    //   iconComponent: Package,
    //   gradientFrom: "from-gray-50",
    //   gradientTo: "to-slate-50",
    //   darkGradientFrom: "dark:from-gray-900/20",
    //   darkGradientTo: "dark:to-slate-900/10",
    //   borderColor: "border-gray-100",
    //   darkBorderColor: "dark:border-gray-700",
    //   hoverBorder: "hover:border-gray-200",
    //   darkHoverBorder: "dark:hover:border-gray-600",
    //   textColor: "text-gray-700",
    //   darkTextColor: "dark:text-gray-300"
    // },
    // {
    //   id: "support",
    //   title: "Customer Support",
    //   desc: "7 days assistance available",
    //   icon: HelpCircle,
    //   color: "cyan",
    //   iconComponent: HelpCircle,
    //   gradientFrom: "from-cyan-50",
    //   gradientTo: "to-teal-50",
    //   darkGradientFrom: "dark:from-cyan-900/20",
    //   darkGradientTo: "dark:to-teal-900/10",
    //   borderColor: "border-cyan-100",
    //   darkBorderColor: "dark:border-cyan-800/30",
    //   hoverBorder: "hover:border-cyan-200",
    //   darkHoverBorder: "dark:hover:border-cyan-700/50",
    //   textColor: "text-cyan-700",
    //   darkTextColor: "dark:text-cyan-300"
    // }
  ];

  // Icon color mapping
  const ICON_COLOR_CLASSES = {
    green: "text-success",
    blue: "text-primary dark:text-primary",
    purple: "text-primary dark:text-purple-400",
    orange: "text-warning dark:text-orange-400",
    gray: "text-muted-foreground",
    cyan: "text-cyan-600 dark:text-cyan-400"
  };

  return (
    <div className="relative">
      {/* Header with left margin */}
     

     

      {/* MOBILE VIEW - Horizontal scroll */}
      <div className="md:hidden relative">
        <div className="
          flex
          overflow-x-auto
          pb-4
          scrollbar
          scrollbar-thin
          scrollbar-track-gray-100
          scrollbar-thumb-gray-300
          hover:scrollbar-thumb-gray-400
          dark:scrollbar-track-gray-800
          dark:scrollbar-thumb-gray-600
          dark:hover:scrollbar-thumb-gray-500
          gap-2
          px-1
        ">
          <div className="flex gap-2 min-w-max">
            {STATIC_SERVICES.map((service) => (
              <div
                key={service.id}
                className="
                  group
                  relative
                  flex-shrink-0
                  w-32
                  min-w-[128px]
                  bg-gradient-to-b
                  from-white
                  to-gray-50
                  dark:from-gray-900/40
                  dark:to-gray-800/20
                  rounded-lg
                  border
                  hover:shadow-md
                  transition-all
                  duration-200
                  overflow-hidden
                  cursor-default
                  p-3
                  flex
                  flex-col
                  items-center
                  text-center
                "
                style={{
                  borderColor: 'var(--border-color, #e5e7eb)'
                }}
              >
                {/* Icon Container */}
                <div className={`
                  relative
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  mb-2
                  bg-gradient-to-br
                  ${service.gradientFrom}
                  ${service.gradientTo}
                  ${service.darkGradientFrom}
                  ${service.darkGradientTo}
                  border
                  ${service.borderColor}
                  ${service.darkBorderColor}
                  group-hover:scale-105
                  transition-transform
                  duration-200
                `}>
                  <service.iconComponent className={`w-3.5 h-3.5 ${ICON_COLOR_CLASSES[service.color]} relative z-10`} />
                </div>

                {/* Text Content */}
                <div className="space-y-1 flex-1">
                  <h4 className={`
                    text-xs
                    font-semibold
                    ${service.textColor}
                    ${service.darkTextColor}
                    leading-tight
                  `}>
                    {service.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      

      {/* Custom Scrollbar Styles - Mobile only */}
     
    </div>
  );
};

export default ProductServices;