import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import { ComponentProps, useEffect, useState } from "react";
import { Image } from "react-native";

type RemoteImageProps = {
  path?: string;
  fallback: string;
} & Omit<ComponentProps<typeof Image>, "source">;

const RemoteProfileImage = ({
  path,
  fallback,
  ...imageProps
}: RemoteImageProps) => {
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!path) return;
    (async () => {
      setImage("");
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        logger.error("RemoteProfileImage: download error", error);
        return;
      }

      if (!data) {
        logger.warn("RemoteProfileImage: no data returned for path", path);
        return;
      }

      try {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setImage(fr.result as string);
        };
      } catch (e) {
        logger.error("RemoteProfileImage: failed to read file data", e);
      }
    })();
  }, [path]);

  if (!image) {
  }

  return <Image source={{ uri: image || fallback }} {...imageProps} />;
};

export default RemoteProfileImage;
