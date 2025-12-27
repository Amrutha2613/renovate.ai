
export type BuildingType = 'Residential' | 'Commercial' | 'Mixed-Use' | 'Institutional' | 'Industrial';
export type LocationType = 'Urban' | 'Rural' | 'Coastal';
export type CulturalStyle = 'Traditional' | 'Modern' | 'Contemporary' | 'Minimalist' | 'Vernacular' | 'Luxury' | 'Eco-Friendly' | 'Fusion';
export type ColorShade = 'Light' | 'Medium' | 'Dark' | 'Pastel' | 'Earth tones' | 'Vibrant';

export interface RoomData {
  id: string;
  name: string;
  color: string;
}

export interface PlanningInput {
  plotArea: string;
  plotLength: string;
  plotBreadth: string;
  buildingType: BuildingType;
  floors: string;
  numRooms: string;
  locationType: LocationType;
  budget: string;
  style: CulturalStyle;
  primaryColor: string;
  shade: ColorShade;
  accentColor: string;
  rooms: RoomData[];
}

export interface GeneratedVisuals {
  buildingBefore: string;
  buildingAfter: string;
  rooms: {
    id: string;
    name: string;
    before: string;
    after: string;
  }[];
  insights: string;
}
