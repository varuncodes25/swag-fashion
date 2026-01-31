import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  Package,
  HelpCircle,
  Shield
} from "lucide-react";

const ProductServices = ({ promises = [] }) => {
  // All static services in a proper array
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
      darkBorderColor: "dark:border-blue-800/30",
      hoverBorder: "hover:border-blue-200",
      darkHoverBorder: "dark:hover:border-blue-700/50",
      textColor: "text-blue-700",
      darkTextColor: "dark:text-blue-300"
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
      title: "Easy Returns",
      desc: "10-day return policy",
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
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
    gray: "text-gray-600 dark:text-gray-400",
    cyan: "text-cyan-600 dark:text-cyan-400"
  };

  return (
    <div className="relative">
      {/* Header with left margin */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Our Promise to You
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Everything you need for a worry-free purchase
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {STATIC_SERVICES.length} benefits
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW - No scroll, grid layout */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-2">
        {STATIC_SERVICES.map((service) => (
          <div
            key={service.id}
            className="
              group
              relative
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
            {/* Background Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} ${service.darkGradientFrom} ${service.darkGradientTo} opacity-10`} />
            </div>

            {/* Icon Container - Small */}
            <div className={`
              relative
              w-9
              h-9
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
              {/* Icon */}
              <service.iconComponent className={`w-4 h-4 ${ICON_COLOR_CLASSES[service.color]} relative z-10`} />
            </div>

            {/* Text Content - Small */}
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
              <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
                {service.desc}
              </p>
            </div>

            {/* Hover Indicator - Small */}
            <div className="
              absolute
              -bottom-0.5
              left-1/2
              -translate-x-1/2
              w-6
              h-0.5
              bg-gradient-to-r
              from-transparent
              via-current
              to-transparent
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-200
            " />
          </div>
        ))}
      </div>

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
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
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