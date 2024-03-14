import mixpanel, { type Config, type Mixpanel } from "mixpanel-browser"
import React, { createContext, useContext, useMemo } from "react"

// Create a MixpanelContext
type MixpanelContext = Mixpanel | undefined
const mixpanelContext = createContext<MixpanelContext>(undefined)

// Custom hook to access the MixpanelContext
export const useMixpanel = (): MixpanelContext => useContext(mixpanelContext)

// MixpanelProvider component
interface MixpanelProviderProps {
  token: string
  config: Partial<Config>
  name: string
  children: React.ReactNode
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({
  token,
  config: _config,
  name: _name,
  children
}) => {
  // Initialize Mixpanel with the provided token
  const name = useMemo(() => _name ?? "react-mixpanel-browser", [_name])

  const config = useMemo(
    () => ({
      ..._config
    }),
    [_config]
  )

  // Expose the mixpanel instance through the context
  const mixpanelContextValue = useMemo(
    () => (token ? mixpanel.init(token, config, name) : undefined),
    [config, name, token]
  )

  return (
    <mixpanelContext.Provider value={mixpanelContextValue}>
      {children}
    </mixpanelContext.Provider>
  )
}
