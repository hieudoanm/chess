package elo

import "math"

var CHANCES = map[string]float64{
	"lost": 0,
	"tied": 0.5,
	"won":  1,
}

var Result = map[string]string{
	"WIN":  "W",
	"DRAW": "D",
	"LOSE": "L",
}

// lol magic http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
var MAGIC float64 = 400

// http://en.wikipedia.org/wiki/Elo_rating_system#Most_accurate_K-factor
// USCF k-factors
var DEFAULT_KFACTOR float64 = 32

func GetKFactor(rating float64) float64 {
	if rating <= 2100 {
		return DEFAULT_KFACTOR
	} else if 2100 < rating && rating <= 2400 {
		return 24
	} else {
		return 16
	}
}

func CalculateOdds(rating float64, opponentRating float64) float64 {
	var difference float64 = opponentRating - rating
	return 1 / (1 + math.Pow(10, difference/MAGIC))
}

func ProcessRating(
	odds float64,
	actualScore float64,
	previousRating float64,
) float64 {
	var difference = actualScore - odds
	var previousKFactor = GetKFactor(previousRating)
	return math.Round(float64(previousRating + previousKFactor*difference))
}

func IfWins(rating float64, opponentRating float64) float64 {
	var odds = CalculateOdds(rating, opponentRating)
	return ProcessRating(odds, CHANCES["won"], rating)
}

func IfDraws(rating float64, opponentRating float64) float64 {
	var odds = CalculateOdds(rating, opponentRating)
	return ProcessRating(odds, CHANCES["tied"], rating)
}

func IfLoses(rating float64, opponentRating float64) float64 {
	var odds = CalculateOdds(rating, opponentRating)
	return ProcessRating(odds, CHANCES["lost"], rating)
}

type EloResponse struct {
	NewPlayerRating   float64 `json:"newPlayerRating"`
	NewOpponentRating float64 `json:"newOpponentRating"`
}

type CalculateOptions struct {
	Result         string  `json:"result"`
	PlayerRating   float64 `json:"playerRating"`
	OpponentRating float64 `json:"opponentRating"`
}

func calculate(options CalculateOptions) EloResponse {
	var eloResponse EloResponse = EloResponse{
		NewPlayerRating:   options.PlayerRating,
		NewOpponentRating: options.OpponentRating,
	}
	if options.Result == Result["WIN"] {
		var newPlayerRating = IfWins(options.PlayerRating, options.OpponentRating)
		var newOpponentRating = IfLoses(options.OpponentRating, options.PlayerRating)
		eloResponse.NewPlayerRating = newPlayerRating
		eloResponse.NewOpponentRating = newOpponentRating
	} else if options.Result == Result["DRAW"] {
		var newPlayerRating = IfDraws(options.PlayerRating, options.OpponentRating)
		var newOpponentRating = IfDraws(options.OpponentRating, options.PlayerRating)
		eloResponse.NewPlayerRating = newPlayerRating
		eloResponse.NewOpponentRating = newOpponentRating
	} else if options.Result == Result["LOSE"] {
		var newPlayerRating = IfLoses(options.PlayerRating, options.OpponentRating)
		var newOpponentRating = IfWins(options.OpponentRating, options.PlayerRating)
		eloResponse.NewPlayerRating = newPlayerRating
		eloResponse.NewOpponentRating = newOpponentRating
	}
	return eloResponse
}
