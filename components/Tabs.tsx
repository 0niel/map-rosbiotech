import React, { useState } from 'react'

interface TabProps {
  name: string
  icon: React.ReactNode
  children: React.ReactNode
  disabled?: boolean
}

const Tab: React.FC<TabProps> = props => {
  return <>{props.children}</>
}

interface TabsProps {
  children: React.ReactNode
  defaultTab?: number
}

const Tabs: React.FC<TabsProps> & { Tab: typeof Tab } = ({
  children,
  defaultTab = 0
}) => {
  const tabs = React.Children.toArray(children).filter(
    child => (child as React.ReactElement).type === Tab
  ) as React.ReactElement<TabProps>[]

  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <>
      <div className="mb-4 border-b border-gray-200">
        <ul className="-mb-px flex flex-wrap justify-center text-center text-sm font-medium text-gray-500">
          {tabs.map((tab, index) => (
            <li key={index} className="mr-2">
              <button
                onClick={() => !tab.props.disabled && setActiveTab(index)}
                className={`inline-flex rounded-t-lg border-b-2 p-4 ${
                  activeTab === index && !tab.props.disabled
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent'
                } ${
                  tab.props.disabled
                    ? 'cursor-not-allowed text-gray-400'
                    : 'hover:border-gray-300 hover:text-gray-600'
                }`}
                disabled={tab.props.disabled}
              >
                <div className="mr-2 h-5 w-5">{tab.props.icon}</div>
                {tab.props.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>{tabs[activeTab]?.props.children}</div>
    </>
  )
}

Tabs.Tab = Tab

export default Tabs
