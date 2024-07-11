import dynamic from 'next/dynamic'

const DynamicLayoutWithSidebar = dynamic(
    () => import('~/components/ui/layoutWithSidebar/LayoutWithSidebar'),
    {
        ssr: true
    }
)

export default DynamicLayoutWithSidebar
