from providers import stripe
from providers import github
from providers import razorpay
from providers import shopify
from providers import slack
from providers import discord
from providers import notion
from providers import supabase

PROVIDERS = {
    "stripe": stripe,
    "github": github,
    "razorpay": razorpay,
    "shopify": shopify,
    "slack": slack,
    "discord": discord,
    "notion": notion,
    "supabase": supabase,
}