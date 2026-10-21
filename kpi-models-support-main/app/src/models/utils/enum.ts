export enum DateGranularity {
    minute = "minute",
    hour = "hour",
    day = "day",
    week = "week",
    month = "month",
    quarter = "quarter",
    year = "year"
}

export enum dependencyStatus{
    warning = "warning",
    error = "error",
    active = "active"
}

export enum typeDetails {
    measure = "measure",
    kpi = "kpi"
}


export enum JobStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    NULL = "NULL"
}

export enum MeasureType {
    rest = "rest",
    influx = "influx",
    postgres = "postgres",
    mysql = "mysql",
    neo4j = "neo4j",
    mongodb = "mongodb",
    graphdb = "graphdb"
}


export enum HttpMethod {
    GET = "GET",
    POST = "POST"
}

//TODO: Enum for each category
export enum unitMeasure {
    // Lunghezza
    METER = "m",
    KILOMETER = "km",
    CENTIMETER = "cm",
    MILLIMETER = "mm",
    MICROMETER = "µm",
    NANOMETER = "nm",
    MILE = "mi",
    YARD = "yd",
    FOOT = "ft",
    INCH = "in",

    // Massa
    KILOGRAM = "kg",
    GRAM = "g",
    MILLIGRAM = "mg",
    MICROGRAM = "µg",
    TONNE = "t",
    POUND = "lb",
    OUNCE = "oz",

    // Tempo
    SECOND = "s",
    MILLISECOND = "ms",
    MICROSECOND = "µs",
    NANOSECOND = "ns",
    MINUTE = "min",
    HOUR = "h",
    DAY = "d",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year",

    // Volume
    LITER = "L",
    MILLILITER = "mL",
    CUBIC_METER = "m³",
    CUBIC_CENTIMETER = "cm³",
    GALLON = "gal",
    QUART = "qt",
    PINT = "pt",
    CUP = "cup",
    FLUID_OUNCE = "fl oz",

    // Area
    SQUARE_METER = "m²",
    SQUARE_KILOMETER = "km²",
    SQUARE_CENTIMETER = "cm²",
    SQUARE_MILLIMETER = "mm²",
    HECTARE = "ha",
    ACRE = "acre",

    // Velocità
    METER_PER_SECOND = "m/s",
    KILOMETER_PER_HOUR = "km/h",
    MILE_PER_HOUR = "mph",

    // Temperatura
    CELSIUS = "°C",
    FAHRENHEIT = "°F",
    KELVIN = "K",

    // Energia
    JOULE = "J",
    KILOJOULE = "kJ",
    CALORIE = "cal",
    KILOCALORIE = "kcal",
    WATT_HOUR = "Wh",
    KILOWATT_HOUR = "kWh",

    // Pressione
    PASCAL = "Pa",
    KILOPASCAL = "kPa",
    BAR = "bar",
    ATMOSPHERE = "atm",
    TORR = "torr",

    // Densità
    KILOGRAM_PER_CUBIC_METER = "kg/m³",
    GRAM_PER_CUBIC_CENTIMETER = "g/cm³",

    // Frequenza
    HERTZ = "Hz",
    KILOHERTZ = "kHz",
    MEGAHERTZ = "MHz",
    GIGAHERTZ = "GHz"
}

