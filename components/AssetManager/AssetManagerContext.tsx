import React, { useContext, useEffect, useState } from 'react'
import { AssetManager } from './AssetManager'
import { ImageAsset } from './ImageAsset'

type Props = {}

const AssetManagerContext = React.createContext({
  isLoaded: false,
  assets: AssetManager.instance,
})

export const useAssetManager = () => {
  return useContext(AssetManagerContext);
}

const AssetManagerProvider = ({ children }: React.PropsWithChildren<Props>) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const assets = AssetManager.instance;

    async function load() {
      assets.add("superpower-image", new ImageAsset("superpower.png"));
      await assets.loadAll();
      setIsLoaded(true);
    }
    load();
    return () => {
      assets.cleanup();
    }
  }, []);

  return (
    <AssetManagerContext.Provider
      value={{
        isLoaded,
        assets: AssetManager.instance
      }}>
      {children}
    </AssetManagerContext.Provider>
  )
}

export default AssetManagerProvider 
