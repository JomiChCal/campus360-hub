export type BannerLink = {
  label: string;
  url: string;
};

export type BannerAnnouncement = {
  title: string;
  message: string;
  link?: BannerLink;
};

export type BannerApiResponse = {
  messages: BannerAnnouncement[];
  rotationIntervalMs: number;
};
