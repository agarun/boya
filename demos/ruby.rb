require 'rspec'

class Sorts
  def self.merge_sort(array, &prc)
    return array if array.length <= 1

    mid_idx = array.length / 2
    merge(
      merge_sort(array.take(mid_idx), &prc),
      merge_sort(array.drop(mid_idx), &prc),
      &prc
    )
  end

  def self.merge(left, right, &prc)
    merged_array = []
    prc = Proc.new { |num1, num2| num1 <=> num2 } unless block_given?
    until left.empty? || right.empty?
      case prc.call(left.first, right.first)
      when -1
        merged_array << left.shift
      when 0
        merged_array << left.shift
      when 1
        merged_array << right.shift
      end
    end

    merged_array + left + right
  end
end

class Api::PhotosController < ApplicationController
  before_action :require_user_logged_in,
                only: %i[create update destroy like unlike]

  def index
    if current_user
      following = current_user.following_ids + [current_user.id]
    else
      following = []
    end

    @users = User
      .includes(:followers, :following, :photos, :profile_photo)
      .where(id: following)
    @photos = Photo
      .where(author_id: following)
      .where.not(is_profile_photo: true)
      .order(created_at: :desc)
      .page(params[:page].to_i / 2 + 1)
      .per(2)
  end
end

describe Dessert do
  let(:chef) { double("chef", name: "Bourdain") }
  let(:tiramisu) { Dessert.new("custard", 10, chef) }

  describe "#initialize" do
    it "sets a type" do
      expect(tiramisu.type).to eq("custard")
    end
  end

  it "sets a quantity" do
    expect(tiramisu.quantity).to eq(10)
  end
end

# I like the safe navigation operator `&.`
